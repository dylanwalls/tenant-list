require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('isomorphic-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); // Parse JSON request body
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/webhook', async (req, res) => {
  let ticket_id = req.body.ticket_id;
  let label_id = req.body.label_id;
  let label_name = req.body.label_name;

  try {
    console.log('REQ BODY: ', req.body);
    console.log('REQ label: ', label_id);

    // Check if the ticket is labelled 'tenantWaitingList'
    if (label_id !== '1662505') {
      console.log('Ticket not labelled as tenantWaitingList. Skipping script.');
      return res.json({ success: true, message: 'Ticket not labelled as tenantWaitingList. No action required.' });
    }
  } catch (error) {
    console.error('Error in webhook processing:', error);
    res.status(500).json({ success: false, message: 'Error in webhook processing' });
  }

  try {
    const ticketData = await sendWhatsAppMessage(ticket_id);
    const incidentDate = new Date().toISOString();

    let sendMessageOptions;

    const postMessageOptions = {
      method: 'POST',
      url: 'https://za-living-api-pub-01.indlu.co/public/api/external/workspace/endpoint/Submit',
      headers: {
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'workspaceCode': 'TWL',
        'recaptchaSiteKey': '70e0159d-7000-403b-a603-6a9ec2624f2e',
        'payload': JSON.stringify({
          'name': ticketData.firstName,
          'surname': ticketData.surname,
          'contactNumber': ticketData.contactNumber,
          'preferredArea': ticketData.preferredArea,
          'preferredMoveIn': ticketData.preferredMoveIn,
          'date': incidentDate,
        }),
      }),
    };

    const postResponse = await fetch(postMessageOptions.url, postMessageOptions);
    const postData = await postResponse.json();

    console.log('API Response:', postData);
    console.log('Preferred Area: ', ticketData.preferredArea)

    // NOLITHA
    if (ticketData.preferredArea === 'Eersterivier' || ticketData.preferredArea === 'Langa' || ticketData.preferredArea === 'Bongweni') {
      apiCallExecuted = false;
      sendMessageOptions = {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA',
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          params: [
            { key: '{{1}}', value: ticketData.firstName },
            { key: '{{2}}', value: ticketData.surname},
            { key: '{{3}}', value: ticketData.contactNumber},
            { key: '{{4}}', value: ticketData.preferredArea},
            { key: '{{5}}', value: ticketData.preferredMoveIn}
          ],
          recipient_phone_number: '+27721703241', // Nolitha's number
          hsm_id: '140117' // Replace with your WhatsApp template HSM ID
        })
      };
    }

    // ZANDI
    else if (ticketData.preferredArea === 'iLitha Park' || ticketData.preferredArea === 'Blue Downs') {
      apiCallExecuted = false;
      sendMessageOptions = {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA',
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          params: [
            { key: '{{1}}', value: ticketData.firstName },
            { key: '{{2}}', value: ticketData.surname},
            { key: '{{3}}', value: ticketData.contactNumber},
            { key: '{{4}}', value: ticketData.preferredArea},
            { key: '{{5}}', value: ticketData.preferredMoveIn}
          ],
          recipient_phone_number: '+27785411797', // Zandi's number
          //   recipient_phone_number: '+27784130968', // Dylan's number
          hsm_id: '140117' // Replace with your WhatsApp template HSM ID
        })
      };
    }
    // Remainder: 'iKwezi Park'
    else { 
      const phoneNumbers = ['+27721703241', '+27785411797'];
      for (const phoneNumber of phoneNumbers) {
        console.log('PHONE NUMBER: ', phoneNumber);
        sendMessageOptions = {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA',
            'accept': 'application/json',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            params: [
              { key: '{{1}}', value: ticketData.firstName },
              { key: '{{2}}', value: ticketData.surname},
              { key: '{{3}}', value: ticketData.contactNumber},
              { key: '{{4}}', value: ticketData.preferredArea},
              { key: '{{5}}', value: ticketData.preferredMoveIn}
            ],
            // recipient_phone_number: '+27658632692', // Vunene's's number
            recipient_phone_number: phoneNumber, // Dylan's number
            hsm_id: '140117' // Replace with your WhatsApp template HSM ID
          })
        };

        try {
          const sendResponse = await fetch('https://app.trengo.com/api/v2/wa_sessions', sendMessageOptions);
          const sendData = await sendResponse.json();
          console.log('API Response:', sendData);
          apiCallExecuted = true;
        } catch (error) {
          console.error('failed to send WhatsApp message:', error);
          return res.status(500).json({ success: false, message: 'Failed to send WhatsApp message' });
        }
      }
    }
    // Single API for if, else if
    if (!apiCallExecuted) {
      try {
        const sendResponse = await fetch('https://app.trengo.com/api/v2/wa_sessions', sendMessageOptions);
        const sendData = await sendResponse.json();
        console.log('API Response:', sendData);
      } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        return res.status(500).json({ success: false, message: 'Failed to send WhatsApp message' });
      }
      return res.json({ success: true, message: 'WhatsApp message sent successfully', ticket: req.body });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ success: false, message: 'Error in webhook processing' });
  }
});


async function sendWhatsAppMessage(ticketId) {
  const options = {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA',
      'accept': 'application/json',
      'content-type': 'application/json'
    },
  };

  try {
    const response = await fetch(`https://app.trengo.com/api/v2/tickets/${ticketId}`, options);
    const data = await response.json();
    const ticket_info = data.custom_data;

    return {
      firstName: ticket_info['firstname'],
      surname: ticket_info['surname'],
      contactNumber: ticket_info['contactNumber'],
      preferredArea: ticket_info['preferredArea'],
      preferredMoveIn: ticket_info['preferredMoveIn'],
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});