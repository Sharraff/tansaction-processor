import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { WalletController } from "../controllers/wallet";
import { AccountController } from "../controllers/acount";
//import { UserController } from "../controllers/user.controller";

const router = Router();

// auth routes
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/register", AuthController.register)


const wallet = new WalletController();

// wallet routes
router.get("/user/:userId", (req, res) => wallet.getUserWallets(req, res));
router.get("/:walletId", (req, res) => wallet.getWalletById(req, res));
router.post("/fund/initiate", (req, res) => wallet.initiateFunding(req, res));
router.post("/credit", (req, res) => wallet.creditWallet(req, res));
router.post("/transfer", (req, res) => wallet.transfer(req, res));
router.get("/banks/list", (req, res) => wallet.listBanks(req, res));
router.post("/banks/verify", (req, res) => wallet.verifyAccount(req, res)); 
router.get("/transaction/:reference", (req, res) => wallet.checkTransactionStatus(req, res));


// Get all users
//router.get("/users", UserController.getAllUsers);

// Get a single user by ID
//router.get("/users/:id", UserController.getUserById);

// Account creation
router.post("/account/create", AccountController.createAccount);

// Fetch accounts
router.get("/account/user/:userId", AccountController.getUserAccounts);
router.get("/account/:accountId", AccountController.getAccountById);

// Verification
router.post("/account/verify", AccountController.verifyAccount);

// Account transactions
router.post("/account/transaction/create", AccountController.createAccountTransaction);

// Reverse transaction
router.post("/account/transaction/:transactionId/reverse", AccountController.reverseTransaction);

// Block/unblock
router.post("/account/:accountId/block", AccountController.blockAccount);
router.post("/account/:accountId/unblock", AccountController.unblockAccount);

// Soft delete
router.delete("/account/:accountId", AccountController.deleteAccount);


// Wallet funding (via account)
router.post("/account/wallet/fund", AccountController.fundWallet);

// Wallet → Wallet transfer
router.post("/wallet/transfer", AccountController.walletTransfer);

// Reverse transaction
router.post("/transaction/:transactionId/reverse", AccountController.reverseTransaction);


export default router;
