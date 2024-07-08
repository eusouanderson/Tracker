import requests

url = 'http://192.168.1.5:25555/api/ets2/telemetry'

try:
    response = requests.get(url)
   
    if response.status_code == 200:
        data = response.json()
        print(data)  
    else:
        print(f'Erro na requisição: {response.status_code}')
except requests.exceptions.RequestException as e:
    print(f'Erro na requisição: {e}')
