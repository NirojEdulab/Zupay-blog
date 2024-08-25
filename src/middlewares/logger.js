import moment from "moment";

const logger = (req, res, next) => {
  const { method, originalUrl } = req;
  const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
  console.log(`[${timestamp}] ${method} ${originalUrl}`);
  next();
};

export default logger;
