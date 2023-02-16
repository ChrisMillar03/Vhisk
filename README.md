# Vhisk
Discord LFG and Reputation system

## Example config.json
```json
{
    "token": "[Token]",
    "invite": "https://discord.gg/invite/example",
    "games": [
        {
            "name": "R6 Casual",
            "value": "lfg_casual"
        },
        {
            "name": "R6 Ranked",
            "value": "lfg_ranked"
        }
    ],
    "http": {
        "host": "localhost",
        "port": 8080,
        "https": false,
        "reverse_proxy": false
    },
    "db": {
        "host": "localhost",
        "user": "root",
        "password": "",
        "database": "vhisk"
    }
}
```
