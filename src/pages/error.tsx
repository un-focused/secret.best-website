import { Box, Paper, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
    const navigate = useNavigate();

    const handleHome = () => navigate('/');

    return (
        <Box
            sx = {
                {
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            }>
            <Paper
                elevation={8}
                sx={
                    {
                        height: '60%',
                        width: 'calc(80% - 200px)',
                        marginTop: '100px',
                        padding: '1.3em',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }
                }>
                <Typography
                    variant='h3'
                    sx = {
                        {
                            marginBottom: '10px'
                        }
                    }>
                    404 Not Found
                </Typography>
                <Button
                    variant="contained"
                    size='large'
                    sx= {
                        {
                            margin: 'auto',
                            marginTop: '10px',
                            marginBottom: '0',
                            width: '50%'
                        }
                    }
                    onClick={ handleHome }>
                    Home
                </Button>
            </Paper>
        </Box>
    );
}