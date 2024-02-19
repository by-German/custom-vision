import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material"

const navItems = ['Home', 'Github'];

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
          {navItems.map((item) => (
            <Button key={item} sx={{ color: '#fff', paddingLeft: "32px", paddingRight: "32px" }}>
              {item}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  )
}