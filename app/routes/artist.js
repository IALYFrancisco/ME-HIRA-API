import { Router } from "express"
import { GetArtist } from "../services/artist.js"
import { isAuthenticated } from "../services/authentication.js";
import { isAdminOrSuperuser } from "../services/user.js";
