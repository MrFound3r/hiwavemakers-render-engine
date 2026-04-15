export interface TemplateDefinition {
  id: string;
  label: string;
  previewUrl: string;
  previewImageUrl: string;
  templateData: {
    template_style: string;
    template_logo: string;
    template_thumbnail: string;
    template_favicon: string;
    template_headline: string;
    template_message: string;
    template_sub_message: string;
    call_to_action: string;
    call_to_action_title: string;
    call_to_action_redirect_link: string;
  };
}

const DEFAULT_TEMPLATE_THUMBNAIL = "https://thisvideosiforyou.com/images/static/thumbnails/hiwave-makers-thumbnail.jpg";

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  template_style_hiwave_makers_1: {
    id: "template_style_hiwave_makers_1",
    label: "HiWaveMakers Template 1",
    previewUrl:
      "https://thisvideosiforyou.com/templates/examples/example_year/hiwave_makers_samples/hiwavemakers_1/welcome_aboard_1_1/template_style_hiwave_makers_1",
    previewImageUrl: "/images/template-previews/hiwavemakers-template-1.jpeg",
    templateData: {
      template_style: "template_style_hiwave_makers_1",
      template_logo: "https://thisvideosiforyou.com/images/static/hiwavemakers-horiz.png",
      template_thumbnail: DEFAULT_TEMPLATE_THUMBNAIL,
      template_favicon: "https://thisvideosiforyou.com/images/static/hiwave-favicon.png",
      template_headline: "We're So Proud of You, {{firstName}}",
      template_message:
        "{{firstName}}, watching you work through ideas, try again when something didn't work, and light up when it finally did has been amazing. Every project you built shows your creativity, patience, and how much you've grown. This video is a small glimpse of your effort, your curiosity, and the confidence you gained along the way—and we couldn't be more proud of you.",
      template_sub_message: "",
      call_to_action: "no",
      call_to_action_title: "",
      call_to_action_redirect_link: "",
    },
  },
  template_style_hiwave_makers_2: {
    id: "template_style_hiwave_makers_2",
    label: "HiWaveMakers Template 2",
    previewUrl:
      "https://thisvideosiforyou.com/templates/examples/example_year/hiwave_makers_samples/hiwavemakers_2/welcome_aboard_1_1/template_style_hiwave_makers_2",
    previewImageUrl: "/images/template-previews/hiwavemakers-template-2.jpeg",
    templateData: {
      template_style: "template_style_hiwave_makers_2",
      template_logo: "https://thisvideosiforyou.com/images/static/hiwavemakers-horiz.png",
      template_thumbnail: DEFAULT_TEMPLATE_THUMBNAIL,
      template_favicon: "https://thisvideosiforyou.com/images/static/hiwave-favicon.png",
      template_headline: "We're So Proud of You, {{firstName}}",
      template_message:
        "{{firstName}}, watching you work through ideas, try again when something didn't work, and light up when it finally did has been amazing. Every project you built shows your creativity, patience, and how much you've grown. This video is a small glimpse of your effort, your curiosity, and the confidence you gained along the way—and we couldn't be more proud of you.",
      template_sub_message: "",
      call_to_action: "no",
      call_to_action_title: "",
      call_to_action_redirect_link: "",
    },
  },
};

export const TEMPLATE_OPTIONS = Object.values(TEMPLATE_REGISTRY).map(({ id, label, previewUrl, previewImageUrl }) => ({
  id,
  label,
  previewUrl,
  previewImageUrl,
}));

export function getTemplateDefinition(templateId: string): TemplateDefinition {
  const template = TEMPLATE_REGISTRY[templateId];

  if (!template) {
    throw new Error(`Unsupported templateId: ${templateId}`);
  }

  return template;
}

export function buildTemplateData(params: { templateId: string; thumbnailUrl?: string | null }) {
  const { templateId, thumbnailUrl } = params;
  const template = getTemplateDefinition(templateId);

  return {
    ...template.templateData,
    template_thumbnail: thumbnailUrl || template.templateData.template_thumbnail,
  };
}
