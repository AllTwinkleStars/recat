import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { ObjectId } from "mongodb";
import { Database, Booking, Listing, BookingsIndex } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import { CreateBookingArgs } from "./types";
import { Stripe } from "../../../lib/api";

export const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  let checkOut = new Date(checkOutDate);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOut) {
    const y = dateCursor.getUTCFullYear();
    const m = dateCursor.getUTCMonth();
    const d = dateCursor.getUTCDate();

    if (!newBookingsIndex[y]) {
      newBookingsIndex[y] = {};
    }

    if (!newBookingsIndex[y][m]) {
      newBookingsIndex[y][m] = {};
    }

    if (!newBookingsIndex[y][m][d]) {
      newBookingsIndex[y][m][d] = true;
    } else {
      throw new Error("Selected dates can't overlap dates that already have been booked");
    }

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newBookingsIndex;
};

export const bookingResolvers: IResolvers = {
  Mutation: {
    createBooking: async (
      _root: undefined,
      { input }: CreateBookingArgs,
      { db, req }: { db: Database, req: Request }
    ): Promise<Booking> => {
      try {
        const { id, source, checkIn, checkOut } = input;

        let viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("Viewer cannot be found");
        }

        const listing = await db.listings.findOne({
          _id: new ObjectId(id)
        });
        if (!listing) {
          throw new Error("Listing cannot be found");
        }

        if (listing.host === viewer._id) {
          throw new Error("Viewer cannot book own listing");
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate < checkInDate) {
          throw new Error("Check out date cannot be before check in date");
        }

        const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);

        const msDiff = checkOutDate.getTime() - checkInDate.getTime();
        const daysDiff = msDiff / 86400000 + 1;
        const totalPrice = listing.price * daysDiff;

        const host = await db.users.findOne({ _id: listing.host });
        if (!host || !host.walletId) {
          throw new Error("The host either cannot be found or has not connected with Stripe");
        }

        await Stripe.charge(totalPrice, source, host.walletId);

        const insertRes = await db.bookings.insertOne({
          _id: new ObjectId(),
          listing: listing._id,
          tenant: viewer._id,
          checkIn,
          checkOut
        });

        const insertedBooking = insertRes.ops[0];

        await db.users.updateOne({ _id: host._id }, { $inc: { income: totalPrice } });
        await db.users.updateOne({ _id: viewer._id }, { $push: { bookings: insertedBooking._id } });

        await db.listings.updateOne({ _id: listing._id }, {
          $set: { bookingsIndex },
          $push: { bookings: insertedBooking._id }
        });

        return insertedBooking;
      } catch (error) {
        throw new Error(`Failed to create a booking: ${error}`);
      }
    }
  },
  Booking: {
    id: (booking: Booking): string => {
      return booking._id.toString();
    },
    listing: (
      booking: Booking,
      _args: {},
      { db }: { db: Database }
    ): Promise<Listing | null> => {
      return db.listings.findOne({ _id: booking.listing });
    }
  }
}
