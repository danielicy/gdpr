import axios from 'axios';
import config from 'config';


console.log('axios url: '+ `${config.apiUrl}`);
export default axios.create({ 
  baseURL: `${config.apiUrl}`
});