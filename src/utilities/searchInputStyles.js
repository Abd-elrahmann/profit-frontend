/**
 * Shared styles for transparent search inputs across the app
 */

/** MUI TextField (variant="outlined") - transparent background, no border */
export const transparentSearchTextFieldSx = {
  bgcolor: 'transparent',
  "& fieldset": { border: "none" },
  "& .MuiOutlinedInput-root": {
    bgcolor: 'transparent',
    "&:hover": { bgcolor: 'transparent' },
    "&.Mui-focused": { bgcolor: 'transparent' },
  },
};

/** MUI InputBase - transparent background */
export const transparentSearchInputBaseSx = {
  bgcolor: 'transparent',
  "&:hover": { bgcolor: 'transparent' },
  "&.Mui-focused": { bgcolor: 'transparent' },
};
