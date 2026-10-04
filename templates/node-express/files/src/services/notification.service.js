"use strict";

const notificationModel = require("../models/notification.model");
const { convertToObjectId } = require("../utils");

const NOTI_TYPE_CONTENT = {
  "SHOP-001": "Vừa mới thêm một sản phẩm",
  "ORDER-001": "Đặt hàng thành công",
  "ORDER-002": "Đặt hàng thất bại",
  "ORDER-003": "Giao hàng thành công",
  "PROMOTION-001": "Vừa mới thêm voucher mới",
};

class NotificationService {
  static async pushNotiToSystem({
    type = "SHOP-001",
    receiverId,
    senderId,
    options = {},
  }) {
    let noti_content = NOTI_TYPE_CONTENT[type];
    const newNoti = await notificationModel({
      noti_content,
      noti_type: type,
      noti_receiverId: receiverId,
      noti_senderId: convertToObjectId(senderId),
      noti_options: options,
    });
    return newNoti;
  }

  static async listNotiByUser({ userId = 1, type = "ALL", isRead = 0 }) {
    const match = {
      noti_receiverId: userId,
    };
    if (type !== "ALL") {
      match["noti_type"] = type;
    }

    return await notificationModel.aggregate([
      {
        $match: match,
      },
      {
        $project: {
          noti_type: 1,
          noti_senderId: 1,
          noti_receiverId: 1,
          noti_content: 1,
          createdAt: 1,
          noti_options: 1,
        },
      },
    ]);
  }
}

module.exports = NotificationService;
