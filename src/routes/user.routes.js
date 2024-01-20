import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js"

const router=Router();

router.get('/login', (req, res) => {
    res.send('Hello, this is login page');
  });

router.post("/register",registerUser)





// Export the router as a default export

export default router;
