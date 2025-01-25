import React from 'react'
import { useAuth } from '../context/Auth.context'
import { Box, Card, CardContent, Typography, Button } from '@mui/material'

const HomePage: React.FC = () => {
  const { user, signOut } = useAuth()

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Card
        sx={{
          width: 400,
          padding: 2,
          boxShadow: 3,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Welcome
          </Typography>
          <Typography variant="body1" color="textSecondary" mb={4}>
            {user?.email || 'Guest'}
          </Typography>
          <Button
            variant="contained"
            color="error"
            size="large"
            fullWidth
            onClick={() => signOut()}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default HomePage
