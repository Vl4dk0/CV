const nodemailer = require('nodemailer');

exports.handler = async (event) => {
	if (event.httpMethod !== 'POST') {
		return { statusCode: 405, body: 'Method Not Allowed' };
	}

	let payload;
	try {
		payload = JSON.parse(event.body);
	} catch (e) {
		return { statusCode: 400, body: 'Invalid JSON' };
	}

	const {
		sessionId,
		event: evt,
		timestamp,
		timestampStart,
		durationSec
	} = payload;

	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST || 'smtp.gmail.com',
		port: process.env.SMTP_PORT || 587,
		secure: false,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS
		}
	});

	let subject, text;
	if (evt === 'start') {
		subject = `👀 CV Viewed (session ${sessionId})`;
		text = `Visitor session ${sessionId} started at ${timestamp}.`;
	} else if (evt === 'end') {
		subject = `⏱️ CV Session (session ${sessionId})`;
		text =
			`Visitor session ${sessionId}:\n` +
			` • started at ${timestampStart}\n` +
			` • ended   at ${timestamp}\n` +
			` • duration: ${durationSec}s`;
	} else {
		return { statusCode: 400, body: 'Unknown event' };
	}

	try {
		await transporter.sendMail({
			from: process.env.SMTP_USER,
			to: process.env.TO_EMAIL,
			subject,
			text
		});
	} catch (err) {
	}

	return { statusCode: 200, body: 'OK' };
};

