import React from 'react';
import ReactDom from 'react-dom';

import {App} from './app';

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

ReactDom.render(<App />, mainElement);

