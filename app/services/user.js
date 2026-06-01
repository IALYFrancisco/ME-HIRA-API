export function isAdminOrSuperuser(request, response, next) {
    let { user } = request
    if(user.status === "admin" || user.status === "superuser"){
        next()
    }else{
        response.status(403).end()
    }
}

export function getCurrentUserInformations(request, response){
    
}