/*
 * @Author: Zz
 * @Date: 2017-04-09 21:43:06
 * @Last Modified by: Zz
 * @Last Modified time: 2017-04-09 21:50:44
 */
import initDB from './initDB';

initDB((error) => {
  if (error) {
    console.log(error);
    throw error;
  }
  console.log('init db success!');
});
