import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
// import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// const clerkPubKey = 'pk_test_xxxxxxxxxxxxxxxxxxxxx' // TODO: Replace with real key
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <ClerkProvider publishableKey={clerkPubKey}> */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    {/* </ClerkProvider> */}
  </React.StrictMode>,
)
