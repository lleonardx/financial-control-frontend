import {
    Alert,
    Snackbar,
    type AlertColor
  } from '@mui/material';
  import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode
  } from 'react';
  
  type SnackbarState = {
    open: boolean;
    message: string;
    severity: AlertColor;
  };
  
  type SnackbarContextType = {
    showSnackbar: (message: string, severity?: AlertColor) => void;
  };
  
  const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);
  
  export function SnackbarProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<SnackbarState>({
      open: false,
      message: '',
      severity: 'success'
    });
  
    const showSnackbar = useCallback((message: string, severity: AlertColor = 'success') => {
      setState({
        open: true,
        message,
        severity
      });
    }, []);
  
    const handleClose = () => {
      setState((prev) => ({
        ...prev,
        open: false
      }));
    };
  
    const value = useMemo(
      () => ({
        showSnackbar
      }),
      [showSnackbar]
    );
  
    return (
      <SnackbarContext.Provider value={value}>
        {children}
  
        <Snackbar
          open={state.open}
          autoHideDuration={3500}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          <Alert
            onClose={handleClose}
            severity={state.severity}
            variant="filled"
            sx={{
              width: '100%',
              borderRadius: 2,
              fontWeight: 700
            }}
          >
            {state.message}
          </Alert>
        </Snackbar>
      </SnackbarContext.Provider>
    );
  }
  
  export function useSnackbar() {
    const context = useContext(SnackbarContext);
  
    if (!context) {
      throw new Error('useSnackbar deve ser usado dentro de SnackbarProvider');
    }
  
    return context;
  }