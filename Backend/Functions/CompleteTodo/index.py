import json
import boto3
from botocore.exceptions import ClientError

dynamo = boto3.resource('dynamodb')
table_name = 'Todos'
table = dynamo.Table(table_name)

def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT"
    }

    try:
        todo_id = int(event.get('queryStringParameters', {}).get('id'))
        
        # Get the current status of the todo item
        response = table.get_item(
            Key={'id': todo_id}
        )
        item = response.get('Item')
        
        if not item:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'message': 'Todo item not found'})
            }
        
        current_status = item.get('status')
        
        # Update the status based on its current value
        new_status = 'completed' if current_status == 'uncompleted' else 'uncompleted'
        
        table.update_item(
            Key={'id': todo_id},
            UpdateExpression='SET #status = :val',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':val': new_status}
        )

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': f'Todo item status updated to {new_status.upper()}'})
        }
    except ValueError as e:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'message': 'Invalid ID format', 'error': str(e)})
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': 'Could not update the item status', 'error': e.response['Error']['Message']})
        }
