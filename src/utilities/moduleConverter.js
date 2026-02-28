export const convertModuleToPermission = (module) => {
  switch (module) {
    case "messages-templates":
      return "messagesTemplates";
    case "journal-entries":
      return "journalEntries";
    case "contract-templates":
      return "contractTemplates";
    default:
      return module;
  }
};