import { HttpMessage, message } from 'simple-passwordless-auth';

if (require.main === module) {
  console.log('hello !');
  message();
  const test: HttpMessage = {} as HttpMessage;
}
