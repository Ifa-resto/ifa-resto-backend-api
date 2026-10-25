import nodemailer, { Transporter } from 'nodemailer'
import logger from '../common/logger'

// Liens ouverts depuis l'e-mail (deep links de l'appli client par défaut)
const RESET_PASSWORD_URL = process.env.RESET_PASSWORD_URL || 'ifaresto://reset-password'
const VERIFY_EMAIL_URL = process.env.VERIFY_EMAIL_URL || 'ifaresto://verify-email'

export class MailService {
  private static transporter: Transporter | null = null

  private static getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter
    if (!process.env.SMTP_HOST) return null

    const port = Number(process.env.SMTP_PORT) || 587
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
    return this.transporter
  }

  static async send(to: string, subject: string, html: string): Promise<void> {
    const transporter = this.getTransporter()
    if (!transporter) {
      logger.warn(`SMTP non configuré : e-mail "${subject}" non envoyé à ${to}`)
      return
    }
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    })
  }

  static async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${VERIFY_EMAIL_URL}?token=${encodeURIComponent(token)}`
    await this.send(
      to,
      'IFA Resto - Vérifiez votre adresse e-mail',
      `<p>Bienvenue sur IFA Resto !</p>
       <p>Pour activer votre compte, ouvrez ce lien depuis votre téléphone :</p>
       <p><a href="${link}">${link}</a></p>
       <p>Ce lien expire dans 24 heures.</p>`,
    )
  }

  static async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const link = `${RESET_PASSWORD_URL}?token=${encodeURIComponent(token)}`
    await this.send(
      to,
      'IFA Resto - Réinitialisation du mot de passe',
      `<p>Vous avez demandé à réinitialiser votre mot de passe.</p>
       <p><a href="${link}">${link}</a></p>
       <p>Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>`,
    )
  }
}
