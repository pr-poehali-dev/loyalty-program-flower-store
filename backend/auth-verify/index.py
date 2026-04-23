"""Верификация SMS-кода и выдача сессионного токена."""
import json
import os
import secrets
import psycopg2


def handler(event: dict, context) -> dict:
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        body = json.loads(event.get('body') or '{}')
        phone = body.get('phone', '').strip()
        code = body.get('code', '').strip()
    except Exception:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неверный формат запроса'})}

    if not phone or not code:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите телефон и код'})}

    schema = os.environ.get('MAIN_DB_SCHEMA', 't_p45377431_loyalty_program_flow')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])

    try:
        with conn.cursor() as cur:
            # Проверяем код
            cur.execute(
                f"""SELECT id FROM {schema}.sms_codes
                    WHERE phone = %s AND code = %s AND used = FALSE AND expires_at > NOW()
                    ORDER BY created_at DESC LIMIT 1""",
                (phone, code)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Неверный или устаревший код'})}

            sms_code_id = row[0]

            # Помечаем код как использованный
            cur.execute(f"UPDATE {schema}.sms_codes SET used = TRUE WHERE id = %s", (sms_code_id,))

            # Создаём или находим пользователя
            cur.execute(f"SELECT id, name, bonus_points, level FROM {schema}.users WHERE phone = %s", (phone,))
            user_row = cur.fetchone()

            if user_row:
                user_id, name, bonus_points, level = user_row
                is_new = False
            else:
                cur.execute(
                    f"INSERT INTO {schema}.users (phone) VALUES (%s) RETURNING id, name, bonus_points, level",
                    (phone,)
                )
                user_id, name, bonus_points, level = cur.fetchone()
                is_new = True

            # Создаём сессионный токен
            token = secrets.token_hex(32)
            cur.execute(
                f"INSERT INTO {schema}.sessions (user_id, token) VALUES (%s, %s)",
                (user_id, token)
            )

        conn.commit()
    finally:
        conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'ok': True,
            'token': token,
            'user': {
                'id': user_id,
                'phone': phone,
                'name': name,
                'bonus_points': bonus_points,
                'level': level,
                'is_new': is_new,
            }
        }, ensure_ascii=False)
    }
