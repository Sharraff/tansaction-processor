import { Router } from "express";
import { AuthController } from "../controllers/auth.ts";
import { WalletController } from "../controllers/wallet.ts";
import { AccountController } from "../controllers/acount.ts";
import { UserController } from "../controllers/user.controller.ts";
import { requireAuth } from "../middleware/requireAuth.ts";
//import { TransactionEngine } from "../controllers/transaction.ts";
import { IncomingTransferWebhook } from "../hooks/incomingTransfer.ts";


const router = Router();

// auth routes
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/register", AuthController.register)


// user routes
router.get("/users", requireAuth, UserController.getAllUsers);
router.get("/users/:id", requireAuth, UserController.getUserById);


const wallet = new WalletController();

// wallet routes
router.get("/user/:userId", requireAuth, (req, res) => wallet.getUserWallets(req, res));
router.post("/wallet", requireAuth, (req, res) => wallet.createWallet(req, res));
router.get("/:walletId", requireAuth, (req, res) => wallet.getWalletById(req, res));
router.post("/fund/initiate", requireAuth, (req, res) => wallet.initiateFunding(req, res));
router.post("/credit", requireAuth, (req, res) => wallet.creditWallet(req, res));
router.post("/transfer", requireAuth, (req, res) => wallet.transfer(req, res));
router.get("/banks/list", requireAuth, (req, res) => wallet.listBanks(req, res));
router.post("/banks/verify", requireAuth, (req, res) => wallet.verifyAccount(req, res)); 
router.get("/transaction/:reference", requireAuth, (req, res) => wallet.checkTransactionStatus(req, res));


// Account routes
router.post("/account/create", requireAuth, AccountController.createAccount);
router.get("/account/user/:userId", requireAuth, AccountController.getUserAccounts);
router.get("/account/:accountId", requireAuth, AccountController.getAccountById);
router.post("/account/verify", requireAuth, AccountController.verifyAccount);
//router.post("/account/transaction/create", AccountController.createAccountTransaction);
router.post("/account/transaction/:transactionId/reverse", requireAuth, AccountController.reverseTransaction);
router.post("/account/:accountId/block", requireAuth, AccountController.blockAccount);
router.post("/account/:accountId/unblock", requireAuth, AccountController.unblockAccount);
router.delete("/account/:accountId", requireAuth, AccountController.deleteAccount);
router.post("/account/wallet/fund", requireAuth, AccountController.fundWallet);
//router.post("/wallet/transfer", AccountController.walletTransfer);
router.post("/transaction/:transactionId/reverse", requireAuth, AccountController.reverseTransaction);
router.post("/account/externaltransfer", requireAuth, AccountController.externalTransfer);
router.post("/webhook/incoming-transfer", IncomingTransferWebhook);

export default router;