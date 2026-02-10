import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { ContactUsQueryDto } from './dto/contact-us-query.dto'
import * as ExcelJS from 'exceljs'
import { I18nService } from 'nestjs-i18n'
import { ContactUsType } from '@prisma/client'
import dayjs from 'dayjs'

@Injectable()
export class ContactUsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly i18n: I18nService,
  ) {}

  async findAll(siteId: number, query: ContactUsQueryDto) {
    const {
      current = 1,
      size = 10,
      type,
      name,
      phone,
      email,
      dealer,
      region,
      annualSalesVolume,
      expectedPurchaseDate,
      postalCode,
      city,
      crmCityCode,
    } = query
    const skip = (current - 1) * size

    const where = {
      siteId,
      ...(type && { type }),
      ...(name && { name: { contains: name } }),
      ...(phone && { phone: { contains: phone } }),
      ...(email && { email: { contains: email } }),
      ...(dealer && { dealer: { contains: dealer } }),
      ...(region && { region: { contains: region } }),
      ...(annualSalesVolume && { annualSalesVolume: { contains: annualSalesVolume } }),
      ...(expectedPurchaseDate && { expectedPurchaseDate }),
      ...(postalCode && { postalCode: { contains: postalCode } }),
      ...(city && { city: { contains: city } }),
      ...(crmCityCode && { crmCityCode: { contains: crmCityCode } }),
    }

    const [total, items] = await Promise.all([
      this.db.contactUs.count({ where }),
      this.db.contactUs.findMany({
        where,
        skip,
        take: size,
        orderBy: { createTime: 'desc' },
      }),
    ])

    return {
      total,
      items,
      current,
      size,
    }
  }

  async findOne(siteId: number, id: number) {
    const contactUs = await this.db.contactUs.findFirst({
      where: { id, siteId },
    })

    if (!contactUs) {
      throw new NotFoundException(`联系我们记录 ${id} 不存在`)
    }

    return contactUs
  }

  async remove(siteId: number, id: number) {
    const contactUs = await this.db.contactUs.findFirst({
      where: { id, siteId },
    })

    if (!contactUs) {
      throw new NotFoundException(`联系我们记录 ${id} 不存在`)
    }

    return this.db.contactUs.delete({
      where: { id },
    })
  }

  async exportToExcel(siteId: number, query: ContactUsQueryDto) {
    const {
      type,
      name,
      phone,
      email,
      dealer,
      region,
      annualSalesVolume,
      expectedPurchaseDate,
      postalCode,
      city,
      crmCityCode,
    } = query

    const where = {
      siteId,
      ...(type && { type }),
      ...(name && { name: { contains: name } }),
      ...(phone && { phone: { contains: phone } }),
      ...(email && { email: { contains: email } }),
      ...(dealer && { dealer: { contains: dealer } }),
      ...(region && { region: { contains: region } }),
      ...(annualSalesVolume && { annualSalesVolume: { contains: annualSalesVolume } }),
      ...(expectedPurchaseDate && { expectedPurchaseDate }),
      ...(postalCode && { postalCode: { contains: postalCode } }),
      ...(city && { city: { contains: city } }),
      ...(crmCityCode && { crmCityCode: { contains: crmCityCode } }),
    }

    const items = await this.db.contactUs.findMany({
      where,
      orderBy: { createTime: 'desc' },
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('联系我们')

    // 类型映射 - 使用 i18n 翻译
    const typeMap = {
      [ContactUsType.BUSINESS]: this.i18n.t('contact-us.type.BUSINESS'),
      [ContactUsType.BUSINESS_DEALER]: this.i18n.t('contact-us.type.BUSINESS_DEALER'),
      [ContactUsType.BUSINESS_CORPORATE_FLEET]: this.i18n.t('contact-us.type.BUSINESS_CORPORATE_FLEET'),
      [ContactUsType.BUSINESS_SUPPLY_TECH]: this.i18n.t('contact-us.type.BUSINESS_SUPPLY_TECH'),
      [ContactUsType.BUSINESS_BRAND]: this.i18n.t('contact-us.type.BUSINESS_BRAND'),
      [ContactUsType.PURCHASE_INTENTION]: this.i18n.t('contact-us.type.PURCHASE_INTENTION'),
      [ContactUsType.SERVICE_SUPPORT]: this.i18n.t('contact-us.type.SERVICE_SUPPORT'),
      [ContactUsType.WEBSITE_BUILDING]: this.i18n.t('contact-us.type.WEBSITE_BUILDING'),
      [ContactUsType.TEST_DRIVE]: this.i18n.t('contact-us.type.TEST_DRIVE'),
    }

    // 设置列标题 - 使用 i18n 翻译
    const headers = [
      { header: this.i18n.t('contact-us.export.type'), key: 'type', width: 15 },
      { header: this.i18n.t('contact-us.export.name'), key: 'name', width: 20 },
      { header: this.i18n.t('contact-us.export.phone'), key: 'phone', width: 15 },
      { header: this.i18n.t('contact-us.export.email'), key: 'email', width: 25 },
      { header: this.i18n.t('contact-us.export.dealer'), key: 'dealer', width: 20 },
      { header: this.i18n.t('contact-us.export.region'), key: 'region', width: 20 },
      { header: this.i18n.t('contact-us.export.annualSalesVolume'), key: 'annualSalesVolume', width: 20 },
      { header: this.i18n.t('contact-us.export.expectedPurchaseDate'), key: 'expectedPurchaseDate', width: 20 },
      { header: this.i18n.t('contact-us.export.postalCode'), key: 'postalCode', width: 15 },
      { header: this.i18n.t('contact-us.export.city'), key: 'city', width: 20 },
      // { header: this.i18n.t('contact-us.export.crmCityCode'), key: 'crmCityCode', width: 20 },
      { header: this.i18n.t('contact-us.export.country'), key: 'country', width: 20 },
      { header: this.i18n.t('contact-us.export.vehicleType'), key: 'vehicleType', width: 20 },
      { header: this.i18n.t('contact-us.export.vehicleVin'), key: 'vehicleVin', width: 25 },
      { header: this.i18n.t('contact-us.export.carColor'), key: 'carColor', width: 15 },
      { header: this.i18n.t('contact-us.export.message'), key: 'message', width: 50 },
      { header: this.i18n.t('contact-us.export.createTime'), key: 'createTime', width: 20 },
    ]

    worksheet.columns = headers

    // 添加数据行
    items.forEach((item) => {
      // 处理时间字段，createTime 可能是时间戳
      let createTimeStr = ''
      if (item.createTime) {
        if (typeof item.createTime === 'number') {
          // 如果是时间戳，转换为日期字符串
          createTimeStr = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
        } else if (item.createTime instanceof Date) {
          // 如果是 Date 对象
          createTimeStr = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
        } else {
          // 其他情况，尝试直接转换
          createTimeStr = String(item.createTime)
        }
      }

      worksheet.addRow({
        type: typeMap[item.type] || item.type,
        name: item.name || '',
        phone: item.phone || '',
        email: item.email || '',
        dealer: item.dealer || '',
        region: item.region || '',
        annualSalesVolume: item.annualSalesVolume || '',
        expectedPurchaseDate: item.expectedPurchaseDate || '',
        postalCode: item.postalCode || '',
        city: item.city || '',
        // crmCityCode: item.crmCityCode || '',
        country: item.country || '',
        vehicleType: item.vehicleType || '',
        vehicleVin: item.vehicleVin || '',
        carColor: item.carColor || '',
        message: item.message || '',
        createTime: createTimeStr,
      })
    })

    // 设置样式
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    }

    return workbook
  }
}
