export const templates = {
  payment_received: {
    en: (name: string, amount: number, ref: string) => `Hi ${name}, we have received your payment of KES ${amount}. Reference: ${ref}. Thank you for using Smart-Rent KE. [AI Assistant Disclosure: This is an automated message].`,
    sw: (name: string, amount: number, ref: string) => `Habari ${name}, tumepokea malipo yako ya KES ${amount}. Marejeleo: ${ref}. Asante kwa kutumia Smart-Rent KE. [Ujumbe huu umetolewa na mfumo wa kiotomatiki].`,
  },
  rent_reminder: {
    en: (name: string, amount: number, dueDate: string) => `Hi ${name}, this is a reminder that your rent of KES ${amount} is due on ${dueDate}. Please pay via M-Pesa to avoid penalties. [AI Assistant Disclosure: This is an automated message].`,
    sw: (name: string, amount: number, dueDate: string) => `Habari ${name}, huu ni ukumbusho kuwa kodi yako ya KES ${amount} inapaswa kulipwa kufikia ${dueDate}. Tafadhali lipa kupitia M-Pesa ili kuepuka faini. [Ujumbe huu umetolewa na mfumo wa kiotomatiki].`,
  },
  lease_expiry: {
    en: (name: string, _: any, expiryDate: string) => `Hi ${name}, your lease is expiring on ${expiryDate}. Please contact management for renewal. [AI Assistant Disclosure: This is an automated message].`,
    sw: (name: string, _: any, expiryDate: string) => `Habari ${name}, mkataba wako unakamilika tarehe ${expiryDate}. Tafadhali wasiliana na usimamizi kwa ajili ya mkataba mpya. [Ujumbe huu umetolewa na mfumo wa kiotomatiki].`,
  },
};
