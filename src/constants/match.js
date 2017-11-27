const defaultProps = {
	download: false,
	uploaded: false,
	send: false,
	inDownload: false,
	inUpload: false,
	uploadUrl: null,
	localFilename: null
};

const searchFields = [
	'download',
	'inDownload',
	'uploaded',
	'inUpload',
	'send',
	'message_id',
	'quality',
	'timestamp',
	'bots'
];

module.exports = {
	defaultProps,
	searchFields
};
