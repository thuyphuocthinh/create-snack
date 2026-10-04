"use strict";

const { NotFoundError } = require("../core/error.response");
const { Template } = require("../models/template.model");
const { generateTemplateHtml } = require("../utils/template.html");

class TemplateService {
  static async getTemplate({ template_name = null }) {
    // check if template_id exists
    const template = await Template.findOne({ template_name }).lean().exec();
    if (!template) {
      throw new NotFoundError("Template not found");
    }
    return template;
  }

  static async createTemplate({
    template_id = null,
    template_name = null,
    template_html = null,
  }) {
    // check if template_id exists
    const template = await Template.findOne({ template_name }).lean().exec();
    if (template) {
      throw new BadRequestError("Template already exists");
    }

    const templateHtml = template_html || generateTemplateHtml();

    // create template
    const newTemplate = await Template.create({
      template_id,
      template_name,
      template_html: templateHtml,
    });

    return newTemplate;
  }
}

module.exports = TemplateService;
