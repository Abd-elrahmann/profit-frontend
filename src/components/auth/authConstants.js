export const AUTH_BACKGROUND =
  "radial-gradient(circle at 20% 20%, rgba(25, 118, 210, 0.08), transparent 25%), radial-gradient(circle at 80% 0%, rgba(14, 165, 233, 0.12), transparent 28%), #f5f7fb";
export const AUTH_BUTTON_SX = {
  py: 1.5,
  fontWeight: 600,
  fontSize: "1rem",
  textTransform: "none",
  backgroundImage: "linear-gradient(135deg, #1e5a2e, #2E8B45)",
  boxShadow: "0 10px 25px rgba(46, 139, 69, 0.35)",
  color: "#fff",
  "&:hover": {
    backgroundImage: "linear-gradient(135deg, #266a39, #3da35a)",
  },
};
export const AUTH_LINK_STYLE = {
  textDecoration: "none",
  fontSize: "0.95rem",
  color: "#2E8B45",
  fontWeight: "bold",
};
export const INPUT_ADORNMENT_SX = {
  height: "100%",
  display: "flex",
  alignItems: "center",
  m: 0,
  mr: 1,
  pointerEvents: "none",
};
export const INPUT_ADORNMENT_LOCK_SX = {
  ...INPUT_ADORNMENT_SX,
  mr: -0.5,
};