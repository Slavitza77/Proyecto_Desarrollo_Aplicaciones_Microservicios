'use strict'
/**
 * Configuración del agente APM de New Relic.
 * La licencia y el nombre se leen de variables de entorno: nunca se escriben aquí.
 */
exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'eventos-node-streaming'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || 'TU_LICENSE_KEY',
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
  distributed_tracing: {
    enabled: true
  },
  application_logging: {
    forwarding: {
      enabled: true
    }
  },
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  }
}
