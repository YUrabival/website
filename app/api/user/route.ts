import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Address {
  id: string;
  isDefault: boolean;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, address } = await req.json();

    // Обновляем данные пользователя
    let addressesUpsert = undefined;
    const user = await prisma.user.findUnique({
      where: { id: 'cmajyh3ey0001cp64jvyje0lp' },
      include: { addresses: true },
    });
    if (user) {
      const defaultAddress = user.addresses.find((a: Address) => a.isDefault);
      if (defaultAddress) {
        addressesUpsert = [
          {
            where: { id: defaultAddress.id },
            update: { ...address, isDefault: true },
            create: { ...address, isDefault: true },
          },
        ];
      } else {
        addressesUpsert = [
          {
            where: { id: 'new-address-id' }, // не будет найден, создастся новый
            update: { ...address, isDefault: true },
            create: { ...address, isDefault: true },
          },
        ];
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: 'cmajyh3ey0001cp64jvyje0lp' },
      data: {
        name,
        email,
        phone,
        addresses: addressesUpsert ? { upsert: addressesUpsert } : undefined,
      },
      include: {
        addresses: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Error updating user profile' },
      { status: 500 }
    );
  }
} 