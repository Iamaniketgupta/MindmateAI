import { Router } from "express";

import { getAllMentors, getAllTherapists, getTherapist, therapistLogin, therapistSignup, updateTherapist} from "../controllers/therapist.js";

const therapistRouter = Router();

therapistRouter.post("/register", therapistSignup);
therapistRouter.post("/login", therapistLogin);
therapistRouter.get("/therapist",getAllTherapists);
therapistRouter.get("/mentor",getAllMentors);
therapistRouter.get("/:id", getTherapist);
therapistRouter.put("/:id", updateTherapist);



// router.post('/gsignin',GoogleSignIn);

export default therapistRouter;
