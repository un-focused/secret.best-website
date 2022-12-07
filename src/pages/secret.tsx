import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Box, Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import axios from '../resources/axiosInstance';
import { useNavigate, useParams } from "react-router-dom";
import Metadata from "../types/metadata";
import EncryptedData from "../types/encryptedData";
import { decryptFileContents } from "../actions/cryptography";
import { jsonArrayToArray } from "../actions/json";
import { downloadFile } from "../actions/file";

interface SBFile {
    name: string;
    extension: string;
    encryptedData: string;
}

interface IncomingEncryptedData {
    cipherText: {
        [key: string]: string;
    };
    iv: {
        [key: string]: string;
    }
}

export default function Secret() {
    const navigate = useNavigate();
    const params = useParams();
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [fileExists, setFileExists] = useState(false);
    // TODO: use snackbar
    const [errorMessage, setErrorMessage] = useState('');
    
    const { id } = params;

    useEffect(
        () => {
            if (!id || isNaN(+id)) {
                setFileExists(false);
                return;
            }

            checkFileExists(+id).then(
                (result) => setFileExists(result)
            )
        },
        [id]
    );

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

    const checkFileExists = async(id: number) => {
        try {
            await axios.get(`SBFiles/exists/${ id }`);

            return true;
        } catch(error) {
            return false;
        }
    }

    // TODO: handle errors
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

        const { cipherText: incomingCipherText, iv: incomingIV } = JSON.parse(stringifiedEncryptedData) as IncomingEncryptedData;
        const cipherText = new Uint16Array(jsonArrayToArray(incomingCipherText));
        const iv = new Uint8Array(jsonArrayToArray(incomingIV));
        const encryptedData: EncryptedData = {
            cipherText,
            iv
        };

        return decryptFileContents(encryptedData, metadata, password);
    }

    const handleHome = () => navigate('/');

    // REFERENCE: https://stackoverflow.com/questions/50694881/how-to-download-file-in-react-js
    const handleDownload = async () => {
        if (!password) {
            setErrorMessage('invalid password');
            return;
        }

        const file = await getFile(password);

        downloadFile(file);
    }

    if (!fileExists) {
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
                        File not found
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={ handleHome }>
                        Home
                    </Button>
                </Paper>
            </Box>
        );
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