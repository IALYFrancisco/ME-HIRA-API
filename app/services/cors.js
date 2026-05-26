export function corsConfigurations(request, response, next){
    response.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_HOST)
    response.setHeader('Access-Control-Allow-Headers', process.env.ALLOWED_HEADERS)
    next()
}