import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material"

const navigateToGithub = () => {
  window.open('https://github.com/by-German', '_blank');
}

export function Header() {
  return (
    <AppBar
      component="nav"
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'transparent',
        boxShadow: 'none',
      }}>
      <Toolbar >
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
        >
          Vehicle Detection
        </Typography>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Button
            sx={{ color: '#fff', paddingLeft: "32px", paddingRight: "32px", marginRight: "16px" }}
            onClick={navigateToGithub}>
            Github
          </Button>
          <Button
            sx={{ color: '#fff', borderColor: '#8b5dc7', paddingLeft: "32px", paddingRight: "32px" }}
            variant="outlined">
            Download Model
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}