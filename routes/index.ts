import { Router } from "express";
import { AuthController } from "../controllers/auth.ts";
import { WalletController } from "../controllers/wallet.ts";
import { AccountController } from "../controllers/acount";
import { UserController } from "../controllers/user.controller.ts";
//import { TransactionEngine } from "../controllers/transaction.ts";

const router = Router();

// auth routes
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/register", AuthController.register)


// user routes
router.get("/users", UserController.getAllUsers);
router.get("/users/:id", UserController.getUserById);


const wallet = new WalletController();

// wallet routes
router.get("/user/:userId", (req, res) => wallet.getUserWallets(req, res));
router.post("/wallets", (req, res) => wallet.createWallet(req, res));
router.get("/:walletId", (req, res) => wallet.getWalletById(req, res));
router.post("/fund/initiate", (req, res) => wallet.initiateFunding(req, res));
router.post("/credit", (req, res) => wallet.creditWallet(req, res));
router.post("/transfer", (req, res) => wallet.transfer(req, res));
router.get("/banks/list", (req, res) => wallet.listBanks(req, res));
router.post("/banks/verify", (req, res) => wallet.verifyAccount(req, res)); 
router.get("/transaction/:reference", (req, res) => wallet.checkTransactionStatus(req, res));




// Account routes
router.post("/account/create", AccountController.createAccount);
router.get("/account/user/:userId", AccountController.getUserAccounts);
router.get("/account/:accountId", AccountController.getAccountById);
router.post("/account/verify", AccountController.verifyAccount);
router.post("/account/transaction/create", AccountController.createAccountTransaction);
router.post("/account/transaction/:transactionId/reverse", AccountController.reverseTransaction);
router.post("/account/:accountId/block", AccountController.blockAccount);
router.post("/account/:accountId/unblock", AccountController.unblockAccount);
router.delete("/account/:accountId", AccountController.deleteAccount);
router.post("/account/wallet/fund", AccountController.fundWallet);
router.post("/wallet/transfer", AccountController.walletTransfer);
router.post("/transaction/:transactionId/reverse", AccountController.reverseTransaction);


export default router;