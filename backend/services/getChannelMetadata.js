import ChannelConfig from "../models/channelConfig.js";

export async function getChannelMetadata(channelNumber) {
  try {
    const config = await ChannelConfig.findOne({ channel: channelNumber }).lean();
    return config || null;
  } catch (error) {
    console.error("Error fetching channel metadata:", error.message);
    return null;
  }
}

export async function getAllChannelMetadata() {
  try {
    const configs = await ChannelConfig.find({}).sort({ channel: 1 }).lean();
    return configs;
  } catch (error) {
    console.error("Error fetching all channel metadata:", error.message);
    return [];
  }
}
