export function corsConfigurations(request, response, next){
    response.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_HOST)
    response.setHeader('Access-Control-Allow-Headers', "content-type")
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST')
    if(request.method === 'OPTIONS'){
        return response.sendStatus(200)
    }
    next()
}