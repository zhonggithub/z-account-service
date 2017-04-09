export default {
  domainHost: `${process.env.DOMAIN_HOST_PREFIX || 'http'}://${process.env.DOMAIN_HOST || 'localhost:3000'}`,
  jwtKey: process.env.JWT_KEY || 'z-account-service',
  jwtTtl: process.env.jwtTtl || 7200,
  ipList: process.env.IP_LIST ? process.env.IP_LIST.split(',') : [],
  aesKey: 'z2#$)^zhj78',
  platormTeanantKey: 'zt001',
  uriPrefix: '/api/accountService/v1',
  initDB: false,
};
