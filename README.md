# CommonTongue
CommonTongue is a live chatting application designed to allows users to communicate irrespective of their preferred language. For a list of all supported languages, refer to Azure's Translator [documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/language-support).

## Local Development
1.) Clone the repository\
2.) Install the node packages with `npm install`\
3.) Create a .env in the root directory, add the following variables:
- `REACT_APP_API_URL`="http://localhost:PORT" (PORT is any port other than the one this app is hosted on (3000 by default)
- `REACT_APP_WEBSOCKET_URL`="ws://localhost:PORT2" (PORT2 any port other than the ones previously chosen

## Tests
There are tests included for the login and signup page, written with `Jest` and `React Testing Library`. Run with `npm run test`.\
For coverage report, run `npm run test:coverage`.

## Deployment
Steps:\
1.) Connect repository to hosting service.\
2.) Set all previously mentioned environment variables again accordingly.