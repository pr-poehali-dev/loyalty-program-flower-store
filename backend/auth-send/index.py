"""Отправка SMS-кода для авторизации по номеру телефона."""
import json
import os
import random
import string
import urllib.request
import urllib.parse
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
    except Exception:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неверный формат запроса'})}

    if not phone:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите номер телефона'})}

    # Нормализуем номер: оставляем только цифры, добавляем +7
    digits = ''.join(c for c in phone if c.isdigit())
    if digits.startswith('8'):
        digits = '7' + digits[1:]
    if not digits.startswith('7'):
        digits = '7' + digits
    if len(digits) != 11:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неверный формат номера телефона'})}

    normalized_phone = '+' + digits
    code = ''.join(random.choices(string.digits, k=4))

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    schema = os.environ.get('MAIN_DB_SCHEMA', 't_p45377431_loyalty_program_flow')

    try:
        with conn.cursor() as cur:
            # Сохраняем код в БД
            cur.execute(
                f"INSERT INTO {schema}.sms_codes (phone, code) VALUES (%s, %s)",
                (normalized_phone, code)
            )
        conn.commit()
    finally:
        conn.close()

    # Отправляем SMS через sms.ru
    api_id = os.environ.get('SMSRU_API_ID', '')
    sms_text = f'Флора: ваш код {code}. Действителен 10 минут.'

    if api_id:
        params = urllib.parse.urlencode({
            'api_id': api_id,
            'to': normalized_phone,
            'msg': sms_text,
            'json': 1,
        })
        try:
            url = f'https://sms.ru/sms/send?{params}'
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as resp:
                sms_response = json.loads(resp.read().decode())
                sms_ok = sms_response.get('status') == 'OK'
        except Exception:
            sms_ok = False
    else:
        # Режим разработки — код в ответе
        sms_ok = True

    result = {'ok': True, 'phone': normalized_phone}
    if not api_id:
        result['dev_code'] = code  # только в режиме без ключа

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(result, ensure_ascii=False)
    }
