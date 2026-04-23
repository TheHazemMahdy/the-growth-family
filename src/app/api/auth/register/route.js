import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email, username, password } = await request.json();

    if (!email || !username || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email or Username already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Make the user an admin if they use the designated admin email
    const role = email === 'communityweb261@gmail.com' ? 'admin' : 'user';

    const verificationToken = crypto.randomUUID();

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role,
        verificationToken
      }
    });

    // Send verification email asynchronously
    const verificationUrl = `http://localhost:3000/verify?token=${verificationToken}`;
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email for The Growth Family',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
          <h1 style="color: #5cb85c;">Verify Your Email</h1>
          <p>Hello <strong>${username}</strong>,</p>
          <p>Please verify your email address to complete your registration.</p>
          <br/>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #5cb85c; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <br/><br/>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions).catch(console.error);

    return NextResponse.json({ message: 'User created. Please check your email to verify your account.' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
