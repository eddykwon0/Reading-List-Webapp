const timer = (req, res, next) => {
  const startHrTime = process.hrtime();

  res.on("finish", () => {
    if (req.body && req.body.operationName) {
      const elapsedHrTime = process.hrtime(startHrTime);
      const elapsedTimeInMs =
        elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
      logger.info({
        type: "timing",
        name: req.body.operationName,
        ms: elapsedTimeInMs
      });
    }
  });

  next();
};