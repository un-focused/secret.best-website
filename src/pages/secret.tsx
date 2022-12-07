import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Box, Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import axios from '../resources/axiosInstance';
import { useNavigate, useParams } from "react-router-dom";
import Metadata from "../types/metadata";
import EncryptedData from "../types/encryptedData";
import { decryptFileContents } from "../actions/cryptography";
import { arrayBufferToUintArray, jsonArrayToArray } from "../actions/json";
import { downloadFile } from "../actions/file";
import Snackbar, { Severity } from "../components/snackbar";
import { getSBFileExists } from "../actions/request";

// TODO: help dialog

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

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [severity, setSeverity] = useState<Severity>('error');
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [fileExists, setFileExists] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const { id } = params;

    useEffect(
        () => {
            if (!id || isNaN(+id)) {
                setFileExists(false);
                return;
            }

            getSBFileExists(+id).then(
                (result) => setFileExists(result)
            )
        },
        [id]
    );

    const setSnackbarData = (severity: Severity, message: string, isOpen = true) => {
        setSeverity(severity);
        setErrorMessage(message);
        setIsSnackbarOpen(isOpen);
    }

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
        const cipherText = arrayBufferToUintArray(jsonArrayToArray(incomingCipherText));
        const iv = new Uint8Array(jsonArrayToArray(incomingIV));
        console.log(cipherText);
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

        // TODO: throw proper errors (handle validation, maybe validation errors??)
        // TODO: 500 errors (currently thrown) on backend need to be sent as proper errors
        try {
            const file = await getFile(password);

            downloadFile(file);

            navigate('/decipher');
        } catch(error) {
            const { message } = error as Error;

            setSnackbarData('error', message);
        }
    }

    if (!fileExists) {
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
                        File not found
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
                elevation={4}
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
                    Get your file
                </Typography>
                <FormControl variant='outlined'
                    sx = {
                        {
                            width: '50%',
                            margin: 'auto'
                        }
                    }>
                    <InputLabel htmlFor='outlined-adornment-password'>Password</InputLabel>
                    <OutlinedInput
                        id='outlined-adornment-password'
                        type={ showPassword ? 'text' : 'password' }
                        value={ password }
                        onChange={ handlePasswordChange }
                        endAdornment={
                            <InputAdornment position='end'>
                                <IconButton
                                    aria-label='toggle password visibility'
                                    onClick={ handleClickShowPassword }
                                    onMouseDown={ handleMouseDownPassword }
                                    edge='end'>
                                    { showPassword ? <VisibilityOff /> : <Visibility /> }
                                </IconButton>
                            </InputAdornment>
                        }
                        label='Password' />
                </FormControl>
                <Button
                    variant='contained'
                    size='large'
                    onClick={ handleDownload }
                    sx= {
                        {
                            margin: 'auto',
                            marginTop: '10px',
                            marginBottom: '0',
                            width: '50%'
                        }
                    }>
                    Download
                </Button>
            </Paper>
            <Snackbar
                isOpen={ isSnackbarOpen }
                setIsOpen={ setIsSnackbarOpen }
                severity={ severity }
                message={ errorMessage } />
        </Box>
    );
}