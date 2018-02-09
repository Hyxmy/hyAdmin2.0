import '@babel/polyfill';
import 'url-polyfill';
import 'moment/locale/zh-cn';
import './index.less';
import './rollbar';

import FastClick from 'fastclick';
import app from './app';


// 3. Register global model
app.model(require('./models/global').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');


FastClick.attach(document.body);
