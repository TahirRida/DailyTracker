import json
import boto3
import logging
from botocore.exceptions import ClientError

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamoDB = boto3.client('dynamodb')

def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",  
        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,DELETE,HEAD"
    }
    
    try:
        logger.info(f"Received event: {event}")
        id = event.get('queryStringParameters', {}).get('id')
        if not id:
            logger.error("Missing id parameter")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'Missing id parameter'})
            }

        request_body = json.loads(event['body'])
        updated_name = request_body.get('name')
        updated_description = request_body.get('description')
        updated_status = request_body.get('status')

        if not updated_name and not updated_description and not updated_status:
            logger.error("Nothing to update")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'Nothing to update'})
            }

        update_expression = 'SET '
        expression_attribute_values = {}
        expression_attribute_names = {}

        if updated_name:
            update_expression += '#newname = :newname, '
            expression_attribute_values[':newname'] = {'S': updated_name}
            expression_attribute_names['#newname'] = 'name'

        if updated_description:
            update_expression += '#desc = :desc, '
            expression_attribute_values[':desc'] = {'S': updated_description}
            expression_attribute_names['#desc'] = 'description'
        
        if updated_status:
            update_expression += '#status = :status, '
            expression_attribute_values[':status'] = {'S': updated_status}
            expression_attribute_names['#status'] = 'status'

        update_expression = update_expression.rstrip(', ')

        logger.info(f"UpdateExpression: {update_expression}")
        logger.info(f"ExpressionAttributeValues: {expression_attribute_values}")
        logger.info(f"ExpressionAttributeNames: {expression_attribute_names}")

        update_params = {
            'TableName': 'Todos',
            'Key': {
                'id': {'N': str(id)}  # Ensure id is a string
            },
            'UpdateExpression': update_expression,
            'ExpressionAttributeValues': expression_attribute_values,
            'ReturnValues': 'ALL_NEW'
        }

        if expression_attribute_names:
            update_params['ExpressionAttributeNames'] = expression_attribute_names

        response = dynamoDB.update_item(**update_params)

        logger.info(f"Update response: {response}")

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response['Attributes'])
        }

    except KeyError as e:
        logger.error(f"KeyError: {e}")
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'message': 'Invalid request format', 'error': str(e)})
        }
    except ClientError as e:
        logger.error(f"ClientError: {e}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': 'Error updating Todo item', 'error': e.response['Error']['Message']})
        }
    except Exception as e:
        logger.error(f"Exception: {e}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': 'Internal server error', 'error': str(e)})
        }
