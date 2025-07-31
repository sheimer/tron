import * as url from 'url'
import http from 'http'

import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import { indexRouter } from './routes/index.js'
import { addWebsockets } from './websockets/index.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export const app = express()
export const server = http.createServer(app)

const appStarted = new Date()
const customCacheControl = (res, file) => {
  res.setHeader('Last-Modified', appStarted.toUTCString())
}

addWebsockets(server)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  express.static(path.join(__dirname, 'public'), {
    setHeaders: customCacheControl,
  }),
)

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})
