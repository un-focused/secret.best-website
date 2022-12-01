import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Box, Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import axios from '../resources/axiosInstance';
import { useLocation, useParams } from "react-router-dom";
import { decryptFileContents, EncryptedData, Metadata } from "../actions/File";

interface SBFile {
    name: string;
    extension: string;
    encryptedData: string;
}

export default function Secret() {
    const params = useParams();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    
    const { id } = params;

    console.log('params', params);
    console.log('location', location);

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        setPassword(value);
    }

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    }

    const getFile = async (password: string) => {
        const { data } = await axios.post(`SBFiles/${ id }`,
            {
                password
            }
        );
        const { name, extension, encryptedData: stringifiedEncryptedData } = data as SBFile;
        const metadata: Metadata = {
            name,
            extension
        }

        const parsedEncryptedData = JSON.parse(stringifiedEncryptedData);
        const encryptedData: EncryptedData = {
            cipherText: new TextEncoder().encode(parsedEncryptedData.cipherText),
            iv: parsedEncryptedData.iv,
        }
        console.log('data', stringifiedEncryptedData);
        console.log('encrypt data', encryptedData);
        const result = await decryptFileContents(encryptedData, metadata, password);

        console.log('{RESULT}', result);
    }

    const handleDownload = async () => {
        if (!password) {
            return;
        }

        const file = getFile(password);
    }

    return (
        <Box>
            <Paper
                elevation={8}
                sx={
                    {
                        padding: '1em',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }
                }>
                <Typography variant="h4" gutterBottom>
                    Get your file
                </Typography>
                <FormControl sx={{ m: 1, width: '50ch' }} variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    { showPassword ? <VisibilityOff /> : <Visibility /> }
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password"
                    />
                </FormControl>
                <Button
                    variant="contained"
                    onClick={ handleDownload }>
                    Download
                </Button>
            </Paper>
        </Box>
    );
}