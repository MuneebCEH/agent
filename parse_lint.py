import json
try:
    with open('lint.json', 'r') as f:
        data = json.load(f)
    for file_info in data:
        if file_info['errorCount'] > 0:
            print(f"{file_info['filePath']}: {file_info['errorCount']} errors, {file_info['warningCount']} warnings")
except Exception as e:
    print(e)
