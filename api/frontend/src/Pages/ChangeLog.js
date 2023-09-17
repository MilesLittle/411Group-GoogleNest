import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { styled } from '@mui/system';

const ChangeLog = () => {

    const Item = styled('div')(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#262B32' : '#fff',
        padding: theme.spacing(1),
        textAlign: 'center',
        borderRadius: 4,
      }));

    return(
        <> 
                <Stack >
                    <Item> <Typography> Name </Typography> </Item>

                {/* TODO: insert picture of selected thermostat */}

                    <Item>
                {/* TODO: add the drop down menu  */}
                         <Typography> Log The Temperature Every: </Typography> 
                    </Item>
                    
                    <Item>
                        {/* TODO: add the menu for the date  */}
                        <Typography> Starting At:   </Typography>

                    </Item>
                 </Stack>

        <Button> Save </Button>

        </>
    ); 
}

export default ChangeLog 