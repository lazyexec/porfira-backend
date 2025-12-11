import express from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import supportValidation from "./support.validation";
import supportController from "./support.controller";

const router = express.Router();

// Create a new support ticket (authenticated users)
router.post(
  "/tickets",
  auth(),
  validate(supportValidation.createTicket),
  supportController.createTicket
);

// Get all tickets (filtered by role)
router.get(
  "/tickets",
  auth(),
  validate(supportValidation.getTickets),
  supportController.getTickets
);

// Get single ticket
router.get(
  "/tickets/:ticketId",
  auth(),
  validate(supportValidation.getTicket),
  supportController.getTicket
);

// Update ticket status
router.patch(
  "/tickets/:ticketId/status",
  auth(),
  validate(supportValidation.updateTicketStatus),
  supportController.updateTicketStatus
);

// Send message to ticket
router.post(
  "/tickets/:ticketId/messages",
  auth(),
  validate(supportValidation.sendMessage),
  supportController.sendMessage
);

// Get messages for a ticket
router.get(
  "/tickets/:ticketId/messages",
  auth(),
  validate(supportValidation.getMessages),
  supportController.getMessages
);

export default router;
